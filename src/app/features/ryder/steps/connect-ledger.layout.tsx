import { Box } from '@stacks/ui';

import { Divider } from '@app/components/divider';

import { PrimaryButton } from '@app/components/primary-button';
import { Caption } from '@app/components/typography';

import { LedgerConnectInstructionTitle } from '../components/ledger-title';
import { ExternalLink } from '@app/components/external-link';
import RyderLogo from '@assets/images/ryder/ryder-logo.png';
import { LedgerWrapper } from '../components/ledger-wrapper';


interface ConnectLedgerLayoutProps {
  isLookingForLedger: boolean;
  awaitingLedgerConnection: boolean;
  warning: React.ReactNode;
  showInstructions: boolean;
  onConnectLedger(): void;
}
export function ConnectLedgerLayout(props: ConnectLedgerLayoutProps) {
  const { onConnectLedger, warning, showInstructions, awaitingLedgerConnection } = props;

  return (
    <LedgerWrapper>
      <Box position="relative" width="100%" height="120px">
        <img src={RyderLogo}/>
      </Box>
      <LedgerConnectInstructionTitle mt="extra-loose" mx="50px" />

      <PrimaryButton
        height="40px"
        my="base"
        onClick={onConnectLedger}
        isLoading={awaitingLedgerConnection}
      >
        Connect
      </PrimaryButton>
      <Box mb="base" mx="extra-loose">
        {warning}
      </Box>
      {showInstructions ? (
        <>
          <Divider />
          <Caption mb="tight" mt="loose">
            First time using Ryder on Hiro Wallet?
          </Caption>
          <ExternalLink href="https://www.ryder.id" fontSize={1}>
            See how to download the Stacks app
          </ExternalLink>
        </>
      ) : null}
    </LedgerWrapper>
  );
}
