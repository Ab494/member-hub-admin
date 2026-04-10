# ── Variables ─────────────────────────────────────────
# These are the inputs to this module
# Like function parameters — caller provides the values

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "memberhub"
}

variable "backend_port" {
  description = "Port the backend runs on"
  type        = number
  default     = 3001
}

variable "frontend_port" {
  description = "Port the frontend runs on"
  type        = number
  default     = 8080
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "memberhub"
}

variable "db_user" {
  description = "Database user"
  type        = string
  default     = "memberhub_user"
}

variable "db_password" {
  description = "Database password — passed in from environment, never hardcoded"
  type        = string
  sensitive   = true   # marks this as secret — won't show in logs
}

variable "node_version" {
  description = "Node.js version to use"
  type        = string
  default     = "18"
}
