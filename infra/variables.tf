variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "The AWS region where resources will be provisioned"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "The infrastructure environment (e.g., dev, staging, prod)"
}

variable "cluster_name" {
  type        = string
  default     = "optics-idp-cluster"
  description = "The name of EKS cluster"
}

