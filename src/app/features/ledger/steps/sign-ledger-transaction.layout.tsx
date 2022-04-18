import { FiInfo } from 'react-icons/fi';
import { color, Box, Flex, Text, Stack } from '@stacks/ui';

import SignLedgerTransaction from '@assets/images/ledger/sign-ledger-transaction.png';
import { Tooltip } from '@app/components/tooltip';
import { Caption } from '@app/components/typography';
import { DividerSeparator } from '@app/components/divider-separator';
import { LedgerTitle } from '../components/ledger-title';
import { LookingForLedgerLabel } from '../components/looking-for-ledger-label';
import { LedgerWrapper } from '../components/ledger-wrapper';
import { LedgerSuccessLabel } from '../components/success-label';

interface TransactionDetailProps {
  children: React.ReactNode;
  title: string;
  tooltipLabel?: string;
}
function TransactionDetail(props: TransactionDetailProps) {
  return (
    <Flex borderColor="#DCDDE2" flexDirection="column">
      <Caption>{props.title}</Caption>
      <Flex alignItems="center" mt="base">
        <Text overflowWrap="break-word" maxWidth="360px">
          {props.children}
        </Text>
        {props.tooltipLabel ? (
          <Tooltip label={props.tooltipLabel} maxWidth="260px" placement="right">
            <Stack>
              <Box
                _hover={{ cursor: 'pointer' }}
                as={FiInfo}
                color={color('text-caption')}
                ml="extra-tight"
                size="14px"
              />
            </Stack>
          </Tooltip>
        ) : null}
      </Flex>
    </Flex>
  );
}

interface SignLedgerTransactionLayoutProps {
  details: [string, string, string?][];
  status: 'awaiting-approval' | 'approved';
}
export function SignLedgerTransactionLayout({ details, status }: SignLedgerTransactionLayoutProps) {
  return (
    <LedgerWrapper>
      <Box mt="tight">
        <img src={SignLedgerTransaction} width="228px" />
      </Box>
      <LedgerTitle mt="loose" mx="50px">
        Verify the transaction details on your Ledger
      </LedgerTitle>
      {status === 'awaiting-approval' && (
        <LookingForLedgerLabel my="extra-loose">Waiting for your approval</LookingForLedgerLabel>
      )}
      {status === 'approved' && <LedgerSuccessLabel my="extra-loose">Approved</LedgerSuccessLabel>}
      <Flex
        bg={color('bg-4')}
        borderRadius="16px"
        flexDirection="column"
        textAlign="left"
        px="extra-loose"
        py="extra-loose"
        width="100%"
      >
        <DividerSeparator>
          {details.map(([title, value, tooltipLabel]) => (
            <TransactionDetail title={title} tooltipLabel={tooltipLabel}>
              {value}
            </TransactionDetail>
          ))}
        </DividerSeparator>
      </Flex>
    </LedgerWrapper>
  );
}