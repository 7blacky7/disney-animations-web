export interface CreateTenantInput {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  showLogoOnLanding?: boolean;
  quizAttribution?: "named" | "anonymous";
}
