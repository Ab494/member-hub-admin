# ── Outputs ───────────────────────────────────────────
# Values shown after terraform apply
# Like return values from a function

output "app_name" {
  description = "Full application name including environment"
  value       = local.full_name
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://localhost:${var.backend_port}"
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://localhost:${var.frontend_port}"
}

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "tags" {
  description = "Tags applied to all resources"
  value       = local.common_tags
}
