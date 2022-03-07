import React, { useState } from 'react';
import { Editor, Frame, useNode, useEditor, Element } from '@craftjs/core';
import {
  Box,
  Input,
  Button as ClButton,
  Select,
} from '@citizenlab/cl2-component-library';
import { Paper } from '@material-ui/core';

import ProjectCard from 'components/ProjectCard';
import TextArea from 'components/UI/TextArea';

// ************** Nestable Container  **************
export const Container = ({ background, padding, children, ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Paper
      {...props}
      ref={(ref) => connect(drag(ref as HTMLElement))}
      style={{ background, padding: `${padding}px`, flexGrow: 1 }}
    >
      {children}
    </Paper>
  );
};

export const ContainerSettings = () => {
  const {
    padding,
    background,
    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
  }));

  return (
    <div>
      <Input
        type="number"
        label="Padding"
        value={padding}
        onChange={(value) => {
          setProp((props) => (props.padding = value));
        }}
      />
      <Input
        type="text"
        label="Background Hex"
        value={background}
        onChange={(value) => {
          setProp((props) => (props.background = value));
        }}
      />
    </div>
  );
};

export const ContainerDefaultProps = {
  background: '#ffffff',
  padding: 3,
};

Container.craft = {
  props: {
    padding: 20,
    background: '#abced2',
  },
  related: {
    settings: ContainerSettings,
  },
};
// ************** Card **************
export const Card = ({
  titleText,
  subtitle,
  buttonStyle,
  background,
  padding = '20px',
}) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Box ref={(ref: any) => connect(drag(ref))}>
      <Box style={{ pointerEvents: 'none' }}></Box>
      <Container background={background} padding={padding}>
        <div className="text-only" style={{ textAlign: 'center' }}>
          <Text text={titleText} fontSize={20} />
          <Text text={subtitle} fontSize={15} />
        </div>
        <div className="buttons-only">
          <ClButton
            style={{}}
            width="auto"
            locale="en"
            buttonStyle={buttonStyle}
          >
            Button Text
          </ClButton>
        </div>
      </Container>
    </Box>
  );
};

const CardSettings = () => {
  const {
    actions: { setProp },
    titleText,
    subtitle,
    background,
  } = useNode((node) => ({
    titleText: node.data.props.titleText,
    subtitle: node.data.props.subtitle,
    background: node.data.props.background,
  }));

  return (
    <div>
      <Input
        type="text"
        label="Title"
        value={titleText}
        onChange={(value) => {
          setProp((props) => (props.titleText = value));
        }}
      />
      <Input
        type="text"
        label="Subtitle"
        value={subtitle}
        onChange={(value) => {
          setProp((props) => (props.subtitle = value));
        }}
      />
      <Input
        type="text"
        label="Background Hex"
        value={background}
        onChange={(value) => {
          setProp((props) => (props.background = value));
        }}
      />
    </div>
  );
};

Card.craft = {
  props: {
    titleText: 'Title',
    background: '#abced2',
  },
  related: {
    settings: CardSettings,
  },
};

// ************** Project **************
const Project = ({ size }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Box ref={(ref: any) => connect(drag(ref))}>
      <Box style={{ pointerEvents: 'none' }}>
        <ProjectCard
          projectId="31e861cf-e73e-44ed-a797-0a76dd6cf8ec"
          size={size}
          layout="twocolumns"
        />
      </Box>
    </Box>
  );
};

const ProjectSettings = () => {
  const {
    actions: { setProp },
    size,
  } = useNode((node) => ({
    size: node.data.props.size,
  }));

  return (
    <div>
      <Select
        value={size}
        options={[
          { label: 'small', value: 'small' },
          { label: 'medium', value: 'medium' },
          { label: 'large', value: 'large' },
        ]}
        onChange={(option) => {
          setProp((props) => (props.size = option.value));
        }}
      />
    </div>
  );
};

Project.craft = {
  props: {
    size: 'medium',
  },
  related: {
    settings: ProjectSettings,
  },
};

// ************** Text **************
const Text = ({ text, fontSize }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div ref={(ref: any) => connect(drag(ref))}>
      <p style={{ fontSize }}>{text}</p>
    </div>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    fontSize,
    text,
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    text: node.data.props.text,
  }));

  return (
    <div>
      <Input
        type="text"
        label="text"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
      <Input
        type="text"
        label="font size"
        value={fontSize}
        onChange={(value) => {
          setProp((props) => (props.fontSize = value));
        }}
      />
    </div>
  );
};

Text.craft = {
  props: {
    text: 'Hi',
    fontSize: 20,
  },
  related: {
    settings: TextSettings,
  },
};

// ************** Button **************
const Button = ({ text, buttonStyle }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Box ref={(ref: any) => connect(drag(ref))}>
      <Box style={{ pointerEvents: 'none' }}>
        <ClButton width="auto" locale="en" buttonStyle={buttonStyle}>
          {text}
        </ClButton>
      </Box>
    </Box>
  );
};

const ButtonSettings = () => {
  const {
    actions: { setProp },
    buttonStyle,
    text,
  } = useNode((node) => ({
    buttonStyle: node.data.props.buttonStyle,
    text: node.data.props.text,
  }));

  return (
    <div>
      <Input
        type="text"
        label="text"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
      <Select
        value={buttonStyle}
        options={[
          { label: 'primary', value: 'primary' },
          { label: 'primary-outlined', value: 'primary-outlined' },
        ]}
        onChange={(option) => {
          setProp((props) => (props.buttonStyle = option.value));
        }}
      />
    </div>
  );
};

Button.craft = {
  props: {
    text: 'Button',
    buttonStyle: 'primary',
  },
  related: {
    settings: ButtonSettings,
  },
};

// ************** Toolbox **************
const Toolbox = () => {
  const { connectors } = useEditor();
  return (
    <Box px={'20px'} py={'20px'}>
      <Box>
        <Box pb={'20px'}>
          <h2>Drag to add</h2>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(ref, <Text text="Hi world" fontSize="20px" />)
            }
          >
            Text
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <Button text="Button" buttonStyle="primary" />
              )
            }
          >
            Button
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(ref, <Project size="medium" />)
            }
          >
            Project
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <Card
                  subtitle="Subtitle"
                  titleText="Title"
                  buttonStyle="primary"
                  background="#abced2"
                />
              )
            }
          >
            Card
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <Element
                  canvas
                  is={Container}
                  padding={20}
                  background="#ffffff"
                  data-cy="root-container"
                ></Element>
              )
            }
          >
            Container
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Element
                    canvas
                    is={Container}
                    padding={20}
                    background="#ffffff"
                    data-cy="root-container"
                    style={{ flexGrow: 1, flexBasis: '50%' }}
                  ></Element>
                  <Element
                    canvas
                    is={Container}
                    padding={20}
                    background="#ffffff"
                    data-cy="root-container"
                    style={{ flexGrow: 1, flexBasis: '50%' }}
                  ></Element>
                </div>
              )
            }
          >
            TwoColumn
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Element
                    canvas
                    is={Container}
                    padding={20}
                    background="#ffffff"
                    data-cy="root-container"
                    style={{ flexGrow: 1, flexBasis: '20%' }}
                  ></Element>
                  <Element
                    canvas
                    is={Container}
                    padding={20}
                    background="#ffffff"
                    data-cy="root-container"
                    style={{ flexGrow: 1, flexBasis: '20%' }}
                  ></Element>
                  <Element
                    canvas
                    is={Container}
                    padding={20}
                    background="#ffffff"
                    data-cy="root-container"
                    style={{ flexGrow: 1, flexBasis: '20%' }}
                  ></Element>
                </div>
              )
            }
          >
            ThreeColumn
          </button>
        </Box>
      </Box>
    </Box>
  );
};

// ************** Settings Panel **************
const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  return selected && isEnabled ? (
    <Box bgColor="rgba(0, 0, 0, 0.06)" mt={'20px'} px={'20px'} py={'20px'}>
      <Box>
        <Box>
          <Box pb={'20px'}>
            <Box>
              <Box>
                <h2>Selected</h2>
              </Box>
              <Box>
                <Box color="primary">{selected.name}</Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {selected.settings && React.createElement(selected.settings)}
        {selected.isDeletable ? (
          <button
            color="default"
            onClick={() => {
              actions.delete(selected.id);
            }}
          >
            Delete
          </button>
        ) : null}
      </Box>
    </Box>
  ) : null;
};

const defaultTree = `{"ROOT":{"type":{"resolvedName":"Box"},"isCanvas":true,"props":{"padding":5,"data-cy":"root-container"},"displayName":"Box","custom":{},"hidden":false,"nodes":["V-P2voDZgz","lYBn3m5ohR","6meg70qIWd"],"linkedNodes":{}},"V-P2voDZgz":{"type":{"resolvedName":"Text"},"isCanvas":false,"props":{"text":"Hi world!","fontSize":"20px"},"displayName":"Text","custom":{},"parent":"ROOT","hidden":false,"nodes":[],"linkedNodes":{}},"lYBn3m5ohR":{"type":{"resolvedName":"Text"},"isCanvas":false,"props":{"text":"It's me again!","fontSize":"20px"},"displayName":"Text","custom":{},"parent":"ROOT","hidden":false,"nodes":[],"linkedNodes":{}},"6meg70qIWd":{"type":{"resolvedName":"Button"},"isCanvas":false,"props":{"text":"Button Here","buttonStyle":"primary"},"displayName":"Button","custom":{},"parent":"ROOT","hidden":false,"nodes":[],"linkedNodes":{}}}`;

// ************** Tree Panel **************
const TreePanel = () => {
  const { query, actions } = useEditor();

  const [treeString, setTreeString] = useState<string | undefined>();

  return (
    <Box px={'20px'} py={'20px'}>
      <ClButton
        locale="en"
        buttonStyle="secondary"
        onClick={() => setTreeString(query.serialize())}
        text="Print tree"
      />
      <ClButton
        locale="en"
        buttonStyle="secondary"
        onClick={() => setTreeString(defaultTree)}
        text="Print default tree"
      />
      <TextArea value={treeString} onChange={(val) => setTreeString(val)} />
      <ClButton
        locale="en"
        buttonStyle="primary"
        onClick={() => treeString && actions.deserialize(treeString)}
        text="Set Editor Content to this tree"
      />
    </Box>
  );
};

export default function ProjectPageBuilder() {
  return (
    <Editor resolver={{ Text, Box, Button, Project, Card, Container }}>
      <Box p="10px">
        <h5>A super simple page editor</h5>
        <Box display="flex" width="100%">
          <Box width="80%">
            <Frame>
              <Element
                canvas
                is={Container}
                padding={5}
                background="#eeeeee"
                data-cy="root-container"
              >
                <Button text="Click me" buttonStyle="primary" />
                <Text fontSize={20} text="Textbox I" data-cy="frame-text" />
                <Element
                  canvas
                  is={Container}
                  padding={6}
                  background="#999999"
                  data-cy="frame-container"
                >
                  <Text text="Textbox II" fontSize={20} />
                </Element>
              </Element>
            </Frame>
          </Box>
          <Box width="20%">
            <Toolbox />
            <SettingsPanel />
          </Box>
        </Box>
        <TreePanel />
      </Box>
    </Editor>
  );
}
// Can't add components that are not registered, simple html tags are registered by default.
