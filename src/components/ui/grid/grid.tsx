import styled, { css } from "styled-components";
import {
  grid,
  gridTemplateAreas,
  GridProps,
  GridTemplateAreasProps,
} from "styled-system";
import { Box } from "../box";

type TGrid = GridProps & GridTemplateAreasProps;

export const Grid = styled(Box)<TGrid>`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;
`;

Grid.displayName = "Grid";
