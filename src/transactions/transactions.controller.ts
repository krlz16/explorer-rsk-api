import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BlockIdentifierPipe } from 'src/common/pipes/block-identifier.pipe';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { TransactionHashValidationPipe } from 'src/common/pipes/transaction-hash.pipe';
import { AddressValidationPipe } from 'src/common/pipes/address-validation.pipe';

@Controller('txs')
export class TransactionsController {
  constructor(private txsService: TransactionsService) {}

  /**
   * Fetches a paginated list of transactions using keyset pagination.
   *
   * @param {number} take - Number of transactions to retrieve per request.
   *                        - Positive values paginate forward (newer transactions).
   *                        - Negative values paginate backward (older transactions).
   *                        - Default is set in `PaginationTakeValidationPipe`.
   * @param {string} [cursor] - The pagination cursor in the format `"blockNumber_transactionIndex"`.
   *                            - Used to determine where to start fetching transactions.
   *                            - If omitted, fetches the most recent transactions.
   *
   * @returns {Promise<{ pagination: { nextCursor: string | null, prevCursor: string | null, take: number }, data: any[] }>}
   *          - **pagination**: Contains the next and previous cursors for navigation.
   *          - **data**: The list of transactions matching the pagination criteria.
   */
  @Get('/')
  getTransactions(
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.txsService.getTransactions(take, cursor);
  }

  @Get('/last24hrs')
  getLast24HoursTransactions() {
    return this.txsService.getLast24HoursTransactions();
  }

  @Get('/pending')
  getPendingTransactions(
    @Query('take', PaginationTakeValidationPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return this.txsService.getPendingTransactions(take, cursor);
  }

  /**
   * Handles the GET request to fetch a transaction by its hash.
   *
   * @param {string} hash - The transaction hash to search for.
   * @returns {Promise<{ data: any }>} - Returns the transaction details if found.
   */
  @Get(':hash')
  getTransactionByHash(
    @Param('hash', TransactionHashValidationPipe) hash: string,
  ) {
    return this.txsService.getTransactionByHash(hash);
  }

  @Get('/block/:blockOrhash')
  getTransactionsByBlock(
    @Param('blockOrhash', BlockIdentifierPipe) blockOrhash: string,
    @Query('take', PaginationTakeValidationPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return this.txsService.getTransactionsByBlock(blockOrhash, take, cursor);
  }

  @Get('/address/:address')
  getTransactionsByAddress(
    @Param('address', AddressValidationPipe) address: string,
    @Query('take', PaginationTakeValidationPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return this.txsService.getTransactionsByAddress(address, take, cursor);
  }
}
