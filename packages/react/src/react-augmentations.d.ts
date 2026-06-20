declare module "react-plugin" {
  interface HTMLAttributes<_T> {
    permission?: string | readonly string[];
    permissionMode?: "hidden" | "disabled";
  }
}
