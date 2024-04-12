const CS = "cs-"; // content-script
const UI = "ui-"; // pages like popup, new tab etc
const EXTERNAL = "external-"; // onExternalMessage

const EVENT_TYPE = {
  action_icon: "action-icon",
  authentication: "authentication",
  create_resource: "create-resource",
  delete_resource: "delete-resource",
  fetch_resource: "fetch-resource",
  update_resource: "update-resource",
  vendor_info: "vendor-info",
};

export const CS_EVENTS = {
  action_icon_set: `${CS}-${EVENT_TYPE.action_icon}-set`,
  action_icon_unset: `${CS}-${EVENT_TYPE.action_icon}-unset`,
  action_icon_set_tab: `${CS}-${EVENT_TYPE.action_icon}-set-tab`,
  action_icon_unset_tab: `${CS}-${EVENT_TYPE.action_icon}-unset-tab`,

  fetch_resource_auto_signin_signature: `${CS}-${EVENT_TYPE.fetch_resource}-auto-signin-signature`,
  fetch_resource_tab_signin: `${CS}-${EVENT_TYPE.fetch_resource}-tab-signin`,

  vendor_info_get_vendor_data: `${CS}-${EVENT_TYPE.vendor_info}-get-vendor-data`,
  vendor_info_attempt_set_vendor_url: `${CS}-${EVENT_TYPE.vendor_info}-attempt-set-vendor-url`,

  authentication_check_agent_connection: `${CS}-${EVENT_TYPE.authentication}-check-agent-connection`,
  authentication_get_signed_headers: `${CS}-${EVENT_TYPE.authentication}-get-signed-headers`,
} as const;

export const UI_EVENTS = {
  action_icon_unset: `${UI}-${EVENT_TYPE.action_icon}-unset`,
  authentication_check_agent_connection: `${UI}-${EVENT_TYPE.authentication}-check-agent-connection`,
  authentication_disconnect_agent: `${UI}-${EVENT_TYPE.authentication}-disconnect-agent`,
  authentication_connect_agent: `${UI}-${EVENT_TYPE.authentication}-connect-agent`,
  authentication_boot_connect_agent: `${UI}-${EVENT_TYPE.authentication}-boot-connect-agent`,
  authentication_generate_passcode: `${UI}-${EVENT_TYPE.authentication}-generate-passcode`,

  create_resource_signin: `${UI}-${EVENT_TYPE.create_resource}-signin`,
  create_resource_identifier: `${UI}-${EVENT_TYPE.create_resource}-identifier`,

  fetch_resource_identifiers: `${UI}-${EVENT_TYPE.fetch_resource}-identifiers`,
  fetch_resource_signins: `${UI}-${EVENT_TYPE.fetch_resource}-signins`,
  fetch_resource_credentials: `${UI}-${EVENT_TYPE.fetch_resource}-credentials`,

  update_resource_auto_signin: `${UI}-${EVENT_TYPE.update_resource}-auto-signin`,
  delete_resource_signins: `${UI}-${EVENT_TYPE.delete_resource}-signins`,
} as const;

export const EXTERNAL_EVENTS = {
  fetch_resource_auto_signin_signature: `${EXTERNAL}-${EVENT_TYPE.fetch_resource}-auto-signin-signature`,
};

type T_CS_EVENTS = (typeof CS_EVENTS)[keyof typeof CS_EVENTS];
type T_UI_EVENTS = (typeof UI_EVENTS)[keyof typeof UI_EVENTS];

// this would make sure the type must be a string from these two objects
type T_EventType = T_CS_EVENTS | T_UI_EVENTS;

type NoInfer<T> = [T][T extends unknown ? 0 : never];

export interface IEventMessage<T> {
  type: T_EventType;
  // this would make sure if data is provided its type must be defined
  data?: NoInfer<T>;
}
