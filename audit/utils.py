def log_action(user, action, entity, entity_id, details=None):
    from audit.models import AuditLog
    AuditLog.objects.create(
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details,
    )