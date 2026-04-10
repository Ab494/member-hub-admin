# ── Production Environment ────────────────────────────
# Same module, different values

terraform {
  required_version = ">= 1.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

module "memberhub" {
  source = "../../modules/app"

  environment   = "production"
  app_name      = "memberhub"
  backend_port  = 3001
  frontend_port = 80       # production uses port 80 (standard HTTP)
  db_name       = "memberhub"
  db_user       = "memberhub_user"
  db_password   = var.db_password
}

output "app_info" {
  value = {
    name         = module.memberhub.app_name
    backend_url  = module.memberhub.backend_url
    frontend_url = module.memberhub.frontend_url
    environment  = module.memberhub.environment
  }
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
