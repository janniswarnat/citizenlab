import React, { memo, useEffect, useState } from 'react';
import { isEmpty, cloneDeep } from 'lodash-es';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// components
import { Section, SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Label, ColorPickerInput, Input } from 'cl2-component-library';

// utils
import { getLayerColor, getLayerType } from 'utils/map';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typing
import { Multiloc } from 'typings';
import { IMapLayerAttributes } from 'services/mapLayers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const StyledSection = styled(Section)`
  margin-bottom: 10px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const CancelButton = styled(Button)`
  margin-left: 10px;
`;

interface Props {
  projectId: string;
  mapLayer: IMapLayerAttributes;
  className?: string;
  onClose: () => void;
}

interface IFormValues {
  title_multiloc: Multiloc | null;
  tooltipContent: Multiloc | null;
  popupContent: Multiloc | null;
  color: string;
  markerSymbol: string;
}

const LayerConfig = memo<Props & InjectedIntlProps & InjectedLocalized>(
  ({ projectId, mapLayer, className, onClose, intl: { formatMessage } }) => {
    const type = getLayerType(mapLayer);

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      title_multiloc: mapLayer?.title_multiloc || null,
      color: getLayerColor(mapLayer),
      markerSymbol:
        mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] || '',
      tooltipContent:
        mapLayer?.geojson?.features?.[0]?.properties?.tooltipContent,
      popupContent: mapLayer?.geojson?.features?.[0]?.properties?.popupContent,
    });

    useEffect(() => {
      formChange(
        {
          title_multiloc: mapLayer?.title_multiloc || null,
          color: getLayerColor(mapLayer),
          markerSymbol:
            mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] ||
            '',
          tooltipContent:
            mapLayer?.geojson?.features?.[0]?.properties?.tooltipContent,
          popupContent:
            mapLayer?.geojson?.features?.[0]?.properties?.popupContent,
        },
        false
      );
    }, [mapLayer]);

    const handleTitleOnChange = (title_multiloc: Multiloc) => {
      formChange({ title_multiloc });
    };

    const handleTooltipContentOnChange = (tooltipContent: Multiloc) => {
      formChange({ tooltipContent });
    };

    const handlePopupContentOnChange = (popupContent: Multiloc) => {
      formChange({ popupContent });
    };

    const handleColorOnChange = (color: string) => {
      formChange({ color });
    };

    const handleMarkerSymbolOnChange = (markerSymbol: string) => {
      formChange({ markerSymbol });
    };

    const validate = () => {
      return true;
    };

    const formChange = (
      changedFormValue: Partial<IFormValues>,
      touched = true
    ) => {
      setTouched(touched);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...changedFormValue,
      }));
    };

    const formProcessing = () => {
      setProcessing(true);
      setErrors({});
    };

    const formSuccess = () => {
      setProcessing(false);
      setErrors({});
      setTouched(false);
      onClose();
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      setErrors(errorResponse?.json?.errors || 'unknown error');
    };

    const handleOnCancel = () => {
      onClose();
    };

    const handleOnSubmit = async () => {
      const { title_multiloc } = formValues;

      if (!processing && validate() && title_multiloc) {
        formProcessing();

        const geojson = cloneDeep(
          mapLayer?.geojson || {}
        ) as GeoJSON.FeatureCollection;

        geojson?.features.forEach((feature) => {
          feature.properties = {
            ...feature.properties,
            fill: formValues.color,
            'fill-opacity': 0.3,
            stroke: formValues.color,
            'stroke-width': 4,
            'stroke-opacity': 1,
            'marker-color': formValues.color,
            'marker-size': 'medium',
            'marker-symbol': formValues.markerSymbol,
            tooltipContent: formValues.tooltipContent,
            popupContent: formValues.popupContent,
          };
        });

        try {
          await updateProjectMapLayer(projectId, mapLayer.id, {
            title_multiloc,
            geojson,
          });
          formSuccess();
        } catch (errorResponse) {
          formError(errorResponse);
        }
      }
    };

    return (
      <Container className={className || ''}>
        <StyledSection>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={formValues.title_multiloc}
              onChange={handleTitleOnChange}
              label={formatMessage(messages.layerName)}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.layerColor} />
            </Label>
            <ColorPickerInput
              type="text"
              value={formValues.color}
              onChange={handleColorOnChange}
            />
          </SectionField>

          {type === 'Point' && (
            <SectionField>
              <Input
                type="text"
                value={formValues.markerSymbol}
                onChange={handleMarkerSymbolOnChange}
                label={formatMessage(messages.iconName)}
              />
            </SectionField>
          )}

          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={formValues.tooltipContent}
              onChange={handleTooltipContentOnChange}
              label={formatMessage(messages.layerTooltip)}
              labelTooltipText={formatMessage(messages.layerTooltip)}
            />
          </SectionField>

          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={formValues.popupContent}
              onChange={handlePopupContentOnChange}
              label={formatMessage(messages.layerPopup)}
              labelTooltipText={formatMessage(messages.layerPopup)}
            />
          </SectionField>
        </StyledSection>

        <Footer>
          <FooterLeft>
            <Button
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
              disabled={!touched}
            >
              <FormattedMessage {...messages.save} />
            </Button>

            <CancelButton
              buttonStyle="secondary"
              onClick={handleOnCancel}
              disabled={processing}
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </FooterLeft>
          <FooterRight>
            {!isEmpty(errors) && (
              <Error
                text={formatMessage(messages.errorMessage)}
                showBackground={false}
                showIcon={false}
              />
            )}
          </FooterRight>
        </Footer>
      </Container>
    );
  }
);

export default injectIntl(injectLocalize(LayerConfig));
