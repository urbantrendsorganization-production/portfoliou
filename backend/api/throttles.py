from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """IP-based throttle for auth endpoints (login/register/google-login).
    Limits brute-force attempts regardless of which username is targeted.
    Rate configured via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['auth']."""
    scope = 'auth'
