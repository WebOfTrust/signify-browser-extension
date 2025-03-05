// Add declaration for js-yaml
declare module 'js-yaml' {
  export function load(yaml: string): any;
  export function dump(obj: any): string;
}

// Add other global declarations as needed 