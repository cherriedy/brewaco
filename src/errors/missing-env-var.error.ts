export class MissingEnvVarError extends Error {
  constructor(variableName: string) {
    super(
      `Environment variable ${variableName} is missing. Please set ${variableName} in your environment configuration.`,
    );
    this.name = "MissingEnvVarError";
  }
}
