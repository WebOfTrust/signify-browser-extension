import { useState } from "react";
import { useIntl } from "react-intl";
import { Box, Card, Button, Flex, Text } from "@components/ui";

interface IFileUpload {
  handleFileUpload: (
    configFile: File | null,
    workflowFile: File | null,
  ) => void;
  isLoading: boolean;
  fileUploadError?: string;
}

export function FileUpload({
  handleFileUpload,
  isLoading,
  fileUploadError,
}: IFileUpload): JSX.Element {
  const { formatMessage } = useIntl();
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleConfigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setConfigFile(e.target.files[0]);
      setError("");
    }
  };

  const handleWorkflowFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setWorkflowFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (!configFile && !workflowFile) {
      setError(formatMessage({ id: "fileupload.error.nofiles" }));
      return;
    }

    handleFileUpload(configFile, workflowFile);
  };

  return (
    <Box paddingX={2} paddingY={4}>
      <Card>
        <>
          <Box paddingX={3} paddingY={2}>
            <Text
              fontWeight="bold"
              textAlign="center"
              $color="bodyColor"
              fontSize={4}
            >
              {formatMessage({ id: "fileupload.title.uploadFiles" })}
            </Text>
          </Box>

          <Box paddingX={3} paddingY={2}>
            <Text fontSize={2} textAlign="center" $color="bodyColor">
              {formatMessage({ id: "fileupload.message.uploadDescription" })}
            </Text>
          </Box>

          {(error || fileUploadError) && (
            <Box paddingX={3} paddingY={1}>
              <Text $color="errorColor" fontSize={2} textAlign="center">
                {error || fileUploadError}
              </Text>
            </Box>
          )}

          <Box paddingX={3} paddingY={2}>
            <Text fontSize={2} fontWeight="bold" $color="bodyColor">
              {formatMessage({ id: "fileupload.label.configFile" })}:
            </Text>
            <Box marginBottom={2}>
              <input
                type="file"
                id="configFile"
                accept=".json,.yaml,.yml"
                onChange={handleConfigFileChange}
              />
              {configFile && (
                <Box marginTop={1}>
                  <Text fontSize={2} $color="bodyColor">
                    {formatMessage({ id: "fileupload.label.selectedFile" })}:{" "}
                    {configFile.name}
                  </Text>
                </Box>
              )}
            </Box>

            <Text fontSize={2} fontWeight="bold" $color="bodyColor">
              {formatMessage({ id: "fileupload.label.workflowFile" })}:
            </Text>
            <Box marginBottom={2}>
              <input
                type="file"
                id="workflowFile"
                accept=".json,.yaml,.yml"
                onChange={handleWorkflowFileChange}
              />
              {workflowFile && (
                <Box marginTop={1}>
                  <Text fontSize={2} $color="bodyColor">
                    {formatMessage({ id: "fileupload.label.selectedFile" })}:{" "}
                    {workflowFile.name}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          <Box paddingX={3} paddingY={2} textAlign="center">
            <Button isLoading={isLoading} handleClick={handleSubmit}>
              <Text fontWeight="normal" $color="">
                {formatMessage({ id: "action.save" })} &amp;{" "}
                {formatMessage({ id: "action.continue" })}
              </Text>
            </Button>
          </Box>
        </>
      </Card>
    </Box>
  );
}
