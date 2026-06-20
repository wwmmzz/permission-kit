import { useMemo, type ReactNode } from "react";
import { createPermissionChecker } from "@permission-kit/core";
import { PermissionContext } from "./PermissionContext";

export function PermissionProvider(props: {
  permissions: readonly string[];
  children: ReactNode;
}) {
  const checker = useMemo(
    () => createPermissionChecker(props.permissions),
    [props.permissions],
  );

  return (
    <PermissionContext.Provider value={checker}>
      {props.children}
    </PermissionContext.Provider>
  );
}
