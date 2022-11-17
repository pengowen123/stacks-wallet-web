import { useNavigate } from 'react-router-dom';

import { Form, Formik } from 'formik';

import { RouteUrls } from '@shared/route-urls';

import { StxAvatar } from '@app/components/crypto-assets/stacks/components/stx-avatar';

import { FormFieldsLayout } from '../../components/form-fields.layout';
import { MemoField } from '../../components/memo-field';
import { RecipientField } from '../../components/recipient-field';
import { SelectedAssetField } from '../../components/selected-asset-field';

interface StacksCryptoCurrencySendFormProps {}
export function StacksCryptoCurrencySendForm({}: StacksCryptoCurrencySendFormProps) {
  const navigate = useNavigate();
  const initialValues = {
    amount: '',
    symbol: '',
    recipient: '',
    fee: null,
  };

  function onSubmit() {}

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <Form>
        <legend>STX Send Form</legend>
        <fieldset>
          <FormFieldsLayout>
            <SelectedAssetField
              icon={<StxAvatar />}
              name="Stacks"
              onClickAssetGoBack={() => navigate(RouteUrls.SendCryptoAsset)}
              symbol="STX"
            />
            <RecipientField />
            <MemoField />
          </FormFieldsLayout>
        </fieldset>
      </Form>
    </Formik>
  );
}