import React from "react";

import TreeScreen from "./TreeScreen";

export default function ManageTreeScreen({
  navigation,
}) {
  return (
    <TreeScreen
      navigation={navigation}
      route={{
        params: {
          isAdmin: true,
        },
      }}
    />
  );
}