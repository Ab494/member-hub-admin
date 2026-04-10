# ── App Module ────────────────────────────────────────
# This module describes the memberhub application infrastructure
# It is environment-agnostic — works for dev, staging, and production

terraform {
  required_version = ">= 1.0"
}

# ── Local values ─────────────────────────────────────
# Computed values derived from variables
locals {
  # Full app name includes environment: memberhub-development, memberhub-production
  full_name = "${var.app_name}-${var.environment}"

  # Common tags applied to all resources
  # In AWS/GCP, tags help you track costs per environment
  common_tags = {
    app         = var.app_name
    environment = var.environment
    managed_by  = "terraform"        # shows this was created by Terraform, not manually
    repo        = "member-hub-admin"
  }

  # Environment-specific settings
  # Production gets more resources, development uses minimal
  is_production = var.environment == "production"

  backend_config = {
    node_env      = var.environment
    port          = var.backend_port
    log_level     = local.is_production ? "warn" : "debug"
    rate_limit    = local.is_production ? 100 : 1000
  }
}

# ── Docker Compose representation ────────────────────
# This generates a docker-compose.yml from Terraform variables
# Real-world use: Terraform would create actual cloud resources
# For learning purposes, we generate config files

resource "local_file" "docker_compose" {
  filename = "${path.module}/../../environments/${var.environment}/docker-compose.generated.yml"

  content = templatefile("${path.module}/docker-compose.tpl", {
    app_name      = var.app_name
    environment   = var.environment
    backend_port  = var.backend_port
    frontend_port = var.frontend_port
    db_name       = var.db_name
    db_user       = var.db_user
    db_password   = var.db_password
    node_version  = var.node_version
    log_level     = local.backend_config.log_level
  })
}

# ── Environment file ──────────────────────────────────
# Generates the .env file for this environment
resource "local_file" "env_file" {
  filename = "${path.module}/../../environments/${var.environment}/.env.generated"

  # sensitive_content prevents the file contents from appearing in logs
  content  = sensitive(templatefile("${path.module}/env.tpl", {
    environment   = var.environment
    backend_port  = var.backend_port
    db_name       = var.db_name
    db_user       = var.db_user
    db_password   = var.db_password
    log_level     = local.backend_config.log_level
    rate_limit    = local.backend_config.rate_limit
  }))
}
