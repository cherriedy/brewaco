/**
 * Contract for a template rendering engine used by the application.
 *
 * Implementations of this interface should be able to render templates
 * (for example Handlebars, EJS, Pug, etc.) and return the rendered HTML
 * string. The project expects an async render function to allow file I/O
 * or async helpers inside templates.
 */
export interface TemplateEngine {
  /**
   * Render a named template with the provided variables.
   *
   * @param templateName - Logical name or path of the template to render.
   * @param variables - Key/value map of template variables. Values are strings.
   * @returns Promise resolving to the rendered HTML string for the template.
   */
  render(
    templateName: string,
    variables: Record<string, string>,
  ): Promise<string>;
}

