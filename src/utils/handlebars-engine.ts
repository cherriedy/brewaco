import { TemplateEngine } from "#interfaces/template-engine.interface.js";
import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class HandlebarsEngine implements TemplateEngine {
  /**
   * Render a Handlebars template with the given variables.
   * @param templateName - Template name without extension (e.g. 'forget-password')
   * @param variables - Key/value pairs for template variables
   * @returns Rendered HTML as a Promise<string>
   */
  async render(
    templateName: string,
    variables: Record<string, string>,
  ): Promise<string> {
    try {
      // Resolve template path relative to project root
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${templateName}.hbs`,
      );

      // Read template file asynchronously
      const content = await fs.readFile(templatePath, "utf-8");

      // Compile and render with Handlebars
      const compiled = Handlebars.compile(content);
      return compiled(variables);
    } catch (error) {
      throw new Error(
        `Failed to render template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
