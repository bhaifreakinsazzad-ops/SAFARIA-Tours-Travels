-- SAFARIA retail public-launch security correction (forward-only).
-- Apply to existing production PostgreSQL after reviewing migration 004.
-- Replaces the previous select-then-upsert race for an initially absent key.
CREATE OR REPLACE FUNCTION consume_rate_limit(
    p_key VARCHAR(128),
    p_window_seconds INT,
    p_max_points INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    points INT,
    remaining INT,
    retry_after_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_new_expire TIMESTAMPTZ;
    v_points INT;
    v_expire TIMESTAMPTZ;
    v_retry INT := 0;
BEGIN
    IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
        RAISE EXCEPTION 'Rate limit key cannot be null or empty';
    END IF;
    IF p_window_seconds <= 0 OR p_window_seconds > 86400 THEN
        RAISE EXCEPTION 'Window seconds must be between 1 and 86400';
    END IF;
    IF p_max_points <= 0 OR p_max_points > 10000 THEN
        RAISE EXCEPTION 'Max points must be between 1 and 10000';
    END IF;

    v_new_expire := v_now + make_interval(secs => p_window_seconds);

    -- One atomic INSERT/ON CONFLICT update also handles the initially absent
    -- key. Row-level locking on the unique key prevents lost increments.
    INSERT INTO public.rate_limits AS counter
      (key, points, expire_at, updated_at)
    VALUES (p_key, 1, v_new_expire, v_now)
    ON CONFLICT (key) DO UPDATE
    SET points = CASE
          WHEN counter.expire_at > v_now THEN counter.points + 1
          ELSE 1
        END,
        expire_at = CASE
          WHEN counter.expire_at > v_now THEN counter.expire_at
          ELSE EXCLUDED.expire_at
        END,
        updated_at = v_now
    RETURNING counter.points, counter.expire_at
    INTO v_points, v_expire;

    IF v_points > p_max_points THEN
        v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_expire - v_now))::INT);
    END IF;
    RETURN QUERY SELECT
        (v_points <= p_max_points),
        v_points,
        GREATEST(0, p_max_points - v_points),
        v_retry;
END;
$$;

REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) TO service_role;
