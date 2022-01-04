import { cx } from '@emotion/css';

import { isFullPage, isPopup } from '@app/common/utils';
import { Body, Title } from '@app/components/typography';

import { fullPageTitle, popupTitle } from '../save-secret-key.styles';

interface SecretKeyMessageProps {
  wordCount: number;
}
export function SecretKeyMessage(props: SecretKeyMessageProps): JSX.Element {
  const { wordCount } = props;

  return (
    <>
      <Title
        className={cx({ [fullPageTitle]: isFullPage }, { [popupTitle]: isPopup })}
        fontWeight={500}
      >
        Your Secret Key
      </Title>
      <Body textAlign={isFullPage ? 'center' : 'left'}>
        Here’s your Secret Key: {wordCount} words that generated your Stacks account. You’ll need it
        to access your account on a new device, in a different wallet, or in case you lose your
        password — so back it up somewhere safe.
      </Body>
    </>
  );
}