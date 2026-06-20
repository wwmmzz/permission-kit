import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { usePermission } from "./usePermission";

export type CanProps = {
  permission: string | readonly string[];
  strategy?: "any" | "all";
  mode?: "hidden" | "disabled";
  fallback?: ReactNode;
  children: ReactNode;
};

export function Can(props: CanProps) {
  const {
    permission,
    strategy = "all",
    mode = "hidden",
    fallback = null,
    children,
  } = props;

  const { canAny, canAll } = usePermission();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const allowed =
    strategy === "any" ? canAny(permissions) : canAll(permissions);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback != null) {
    return <>{fallback}</>;
  }

  if (mode === "disabled") {
    return <>{disableChildren(children)}</>;
  }

  return null;
}

function disableChildren(children: ReactNode): ReactNode {
  if (!isValidElement(children)) {
    return children;
  }

  return cloneElement(children as ReactElement<any>, {
    disabled: true,
    "aria-disabled": true,
  });
}
