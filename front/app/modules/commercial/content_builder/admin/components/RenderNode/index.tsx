import React, { useEffect } from 'react';
import styled from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// craft
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const CONTAINER = 'Container';
const TWO_COLUMNS = 'TwoColumn';
const TEXT = 'Text';

type ComponentNamesType = typeof CONTAINER | typeof TWO_COLUMNS | typeof TEXT;

export const getComponentNameMessage = (name: ComponentNamesType) => {
  switch (name) {
    case CONTAINER:
      return messages.oneColumn;
    case TWO_COLUMNS:
      return messages.twoColumn;
    case TEXT:
      return messages.text;
  }
};

const StyledBox = styled(Box)`
  cursor: ${({ isRoot }: { isRoot: boolean }) => (isRoot ? 'auto' : 'move')};
`;

const RenderNode = ({ render }) => {
  const {
    isActive,
    isDeletable,
    parentId,
    actions: { selectNode },
    query: { node },
  } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
    parentId: id && query.node(id).ancestors()[0],
    isDeletable: id && query.node(id).isDeletable(),
  }));

  const { id, name, isHover } = useNode((node) => ({
    isHover: node.events.hovered,
    name: node.data.name as ComponentNamesType,
  }));

  const parentNode = parentId && node(parentId).get();
  const parentNodeName = parentNode && parentNode.data.name;

  // Handle two column hover state
  useEffect(() => {
    const parentNodeElement = document.getElementById(parentId);

    if (parentNodeName === TWO_COLUMNS && isHover) {
      parentNodeElement?.setAttribute(
        'style',
        `border: 1px solid ${colors.adminTextColor} `
      );
    } else {
      parentNodeElement?.removeAttribute('style');
    }
  }, [isHover, id, parentNodeName, parentId]);

  // Handle selected state
  useEffect(() => {
    if (isActive && name === CONTAINER && parentNode) {
      parentNodeName === TWO_COLUMNS && selectNode(parentId);
    }
  });

  const nodeIsSelected = isActive && id !== ROOT_NODE && isDeletable;
  const nodeIsHovered =
    isHover && id !== ROOT_NODE && parentNodeName !== TWO_COLUMNS;

  const solidBorderIsVisible = nodeIsSelected || nodeIsHovered;

  return (
    <StyledBox
      id={id}
      position="relative"
      border={`1px ${
        solidBorderIsVisible
          ? `solid ${colors.adminTextColor}`
          : name !== TWO_COLUMNS
          ? `dashed ${colors.separation}`
          : `solid transparent`
      } `}
      m="4px"
      isRoot={id === ROOT_NODE}
    >
      {nodeIsSelected && (
        <Box
          p="4px"
          bgColor={colors.adminTextColor}
          color="#fff"
          position="absolute"
          top="-28px"
          left="-1px"
        >
          <FormattedMessage {...getComponentNameMessage(name)} />
        </Box>
      )}
      {render}
    </StyledBox>
  );
};

export default RenderNode;
