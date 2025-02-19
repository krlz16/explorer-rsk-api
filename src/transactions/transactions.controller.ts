import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BlockIdentifierPipe } from 'src/common/pipes/block-identifier.pipe';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { TransactionHashValidationPipe } from 'src/common/pipes/transaction-hash.pipe';

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
  getTxs(
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
  getPendingTransactions() {
    return this.txsService.getPendingTransactions();
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
  getTxByBlock(
    @Param('blockOrhash', BlockIdentifierPipe) blockOrhash: string,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxsByBlock(blockOrhash, page_data, take_data);
  }

  @Get('/address/:address')
  getTxsByAddress(
    @Param('address') address: string,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxsByAddress(address, page_data, take_data);
  }
}
