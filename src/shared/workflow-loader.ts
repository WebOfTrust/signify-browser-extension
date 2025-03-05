import { randomPasscode } from "signify-ts";

/**
 * Browser-friendly workflow loading utilities
 */
export const workflowLoader = {
  /**
   * Load workflow from a file using fetch (browser compatible)
   */
  async loadWorkflow(workflowId: string) {
    try {
      // In browser extension context, we need to use the chrome extension URL
      const browser = (window as any).browser || (window as any).chrome;

      // Map workflow IDs to actual file paths
      const workflowPaths: Record<string, string> = {
        "create-client": "src/workflows/create-client-workflow.yaml",
      };

      const path = workflowPaths[workflowId];
      if (!path) {
        throw new Error(`Workflow path not found for ID: ${workflowId}`);
      }

      // Use extension URL to access bundled files
      const url = browser.runtime.getURL(path);
      console.log(`Loading workflow from: ${url}`);

      const response = await fetch(url);
      const yamlText = await response.text();
      console.log("Loaded workflow YAML:", yamlText.substring(0, 100) + "...");

      // Parse YAML using our simple parser
      return this.parseYaml(yamlText);
    } catch (error) {
      console.error("Error loading workflow:", error);

      // Fallback to using predefined workflows
      return this.getDefaultWorkflow(workflowId);
    }
  },

  /**
   * Load config from a file using fetch (browser compatible)
   */
  async loadConfig(configId: string, options: any = {}) {
    try {
      // In browser extension context, we need to use the chrome extension URL
      const browser = (window as any).browser || (window as any).chrome;

      // Map config IDs to actual file paths
      const configPaths: Record<string, string> = {
        "create-client-config": "src/user_config/create-client-config.json",
      };

      const path = configPaths[configId];
      if (!path) {
        throw new Error(`Config path not found for ID: ${configId}`);
      }

      // Use extension URL to access bundled files
      const url = browser.runtime.getURL(path);
      console.log(`Loading config from: ${url}`);

      const response = await fetch(url);
      const configText = await response.text();
      console.log("Loaded config JSON:", configText.substring(0, 100) + "...");

      const config = JSON.parse(configText);

      // Update the config with runtime values if necessary
      if (config.agents?.browser_extension) {
        if (options.agentUrl)
          config.agents.browser_extension.url = options.agentUrl;
        if (options.bootUrl)
          config.agents.browser_extension.boot_url = options.bootUrl;
        if (options.passcode)
          config.agents.browser_extension.passcode = options.passcode;
      }

      return config;
    } catch (error) {
      console.error("Error loading config:", error);

      // Fallback to using predefined configs
      return this.getDefaultConfig(configId, options);
    }
  },

  /**
   * Generate a new passcode and get a config with it
   */
  async generatePasscodeAndConfig() {
    try {
      // Try to load the actual config file first
      const config = await this.loadConfig("create-client-config");

      // Update with a new passcode
      const passcode = randomPasscode();
      if (config.agents?.browser_extension) {
        config.agents.browser_extension.passcode = passcode;
      }

      console.log("Generated new passcode for existing config:", passcode);
      return { passcode, config };
    } catch (error) {
      console.error("Error loading config for passcode generation:", error);
      // Generate a new passcode
      const passcode = randomPasscode();

      // Fallback to default config
      const config = this.getDefaultConfig("create-client-config", {
        passcode,
      });
      console.log("Using default config with new passcode:", passcode);
      return { passcode, config };
    }
  },

  /**
   * Simple YAML parser for workflow files
   */
  parseYaml(yamlText: string) {
    try {
      // Simple two-level parser for the workflow format we need
      const result: any = {};
      let currentObj: any = null;
      let currentKey = "";

      const lines = yamlText.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        // Handle first level keys (workflow:)
        if (trimmed.endsWith(":") && !line.startsWith(" ")) {
          currentKey = trimmed.slice(0, -1);
          result[currentKey] = {};
          currentObj = result[currentKey];
        }
        // Handle second level keys (description:, steps:)
        else if (
          trimmed.endsWith(":") &&
          line.startsWith("  ") &&
          !line.startsWith("    ")
        ) {
          const key = trimmed.slice(0, -1);
          currentObj[key] = trimmed.includes("steps") ? {} : "";
        }
        // Handle third level keys (create_client:)
        else if (
          trimmed.endsWith(":") &&
          line.startsWith("    ") &&
          !line.startsWith("      ")
        ) {
          const key = trimmed.slice(0, -1);
          currentObj.steps[key] = {};
        }
        // Handle fourth level keys (id:, type:, etc)
        else if (trimmed.includes(":") && line.startsWith("      ")) {
          const [key, value] = trimmed.split(":").map((s) => s.trim());
          const stepKey = Object.keys(currentObj.steps)[0]; // Assuming single step
          currentObj.steps[stepKey][key] = value.replace(/"/g, "");
        }
        // Handle simple key-value pairs at second level
        else if (trimmed.includes(":") && line.startsWith("  ")) {
          const [key, value] = trimmed.split(":").map((s) => s.trim());
          currentObj[key] = value.replace(/"/g, "");
        }
      }

      console.log("Parsed YAML:", JSON.stringify(result, null, 2));
      return result;
    } catch (e) {
      console.error("Error parsing YAML:", e);
      return null;
    }
  },

  /**
   * Get default workflow definition when file loading fails
   */
  getDefaultWorkflow(workflowId: string) {
    const workflows: Record<string, any> = {
      "create-client": {
        workflow: {
          description: "Create and boot Signify client using workflow",
          steps: {
            create_client: {
              id: "create_client_step",
              type: "create_client",
              description: "Create Signify client",
              agent_name: "browser_extension",
            },
          },
        },
      },
    };

    const workflow = workflows[workflowId as keyof typeof workflows];
    return workflow ? { ...workflow } : null;
  },

  /**
   * Get default config when file loading fails
   */
  getDefaultConfig(configId: string, options: any = {}) {
    const configs: Record<string, any> = {
      "create-client-config": {
        agents: {
          browser_extension: {
            url: options.agentUrl || "",
            boot_url: options.bootUrl || "",
            passcode: options.passcode || "",
          },
        },
        workflows: {
          create_client: {
            enabled: true,
            steps: {
              create_client: {
                enabled: true,
              },
            },
          },
        },
      },
    };

    const config = configs[configId as keyof typeof configs];
    return config ? { ...config } : null;
  },
};
