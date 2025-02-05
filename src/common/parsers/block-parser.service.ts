import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { block as IBlock } from '@prisma/client';

@Injectable()
export class BlockParserService {
  /**
   * Formats an array of blocks with additional calculated properties.
   *
   * @param {IBlock[]} blocks - An array of block objects to format.
   * @returns {any[]} - An array of formatted blocks.
   */
  formatBlock(blocks: IBlock[]): any[] {
    // Reverse blocks to ensure processing starts with the latest block
    const currentBlocks = [...blocks].reverse();
    const previousBlocks = currentBlocks.slice(1);

    // Map over each block to compute additional properties
    const formattedBlocks = previousBlocks.map((block, i) => {
      const prevBlock = currentBlocks[i];
      const timeDifference = block.timestamp - prevBlock.timestamp;

      const difficultyInGH = this.calculateDifficultyInGH(block.difficulty);
      const totalDifficultyInEH = this.calculateTotalDifficultyInEH(
        block.totalDifficulty,
      );

      const transactions = JSON.parse(block.transactions);
      const transactionsCount = transactions.length;

      const blockHashrateInMHs = this.calculateBlockHashrate(
        block.difficulty,
        timeDifference.toString(),
      );

      const txDensity = transactionsCount / Number(timeDifference) || 0;
      const readableTime = this.secondsToReadableTime(timeDifference);

      const minimumGasPriceInGwei = new BigNumber(block.minimumGasPrice)
        .dividedBy(1e9)
        .toNumber();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { received, ...cleanedBlock } = block;

      return {
        ...cleanedBlock,
        uncles: JSON.parse(block.uncles),
        minimumGasPrice: minimumGasPriceInGwei,
        difficultyInGH,
        totalDifficultyInEH,
        blockHashrateInMHs,
        timestamp: block.timestamp.toString(),
        transactions: transactionsCount,
        txDensity,
        time: readableTime,
      };
    });

    // Return formatted blocks in original order
    return formattedBlocks.reverse();
  }

  /**
   * Converts a duration in seconds to a human-readable format (e.g., "5m 30s").
   *
   * @param {bigint} seconds - The duration in seconds as a bigint.
   * @returns {string} - The duration formatted as "Xm Ys", where X is minutes and Y is seconds.
   */
  private secondsToReadableTime(seconds: bigint): string {
    const totalSeconds = Number(seconds);

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Converts the difficulty from hexadecimal to gigahashes (GH).
   *
   * @param {string} difficultyHex - The difficulty value in hexadecimal format.
   * @returns {number} - The difficulty in gigahashes (GH).
   */
  private calculateDifficultyInGH(difficultyHex: string): number {
    const difficulty = new BigNumber(difficultyHex, 16);
    const difficultyInGigahashes = difficulty.dividedBy(1e9);

    return difficultyInGigahashes.toNumber();
  }

  /**
   * Converts the total difficulty from hexadecimal to exahashes (EH).
   *
   * @param {string} totalDifficultyHex - The total difficulty value in hexadecimal format.
   * @returns {number} - The total difficulty in exahashes (EH).
   */
  private calculateTotalDifficultyInEH(totalDifficultyHex: string): number {
    const totalDifficulty = new BigNumber(totalDifficultyHex, 16);
    const totalDifficultyInExahashes = totalDifficulty.dividedBy(1e18);

    return totalDifficultyInExahashes.toNumber();
  }
  /**
   * Calculates the block hashrate in megahashes per second (MH/s).
   *
   * @param {string} difficultyHex - The hexadecimal difficulty value of the block.
   * @param {string} averageBlockTimeSeconds - The average time taken to mine a block, in seconds.
   * @returns {number} - The block hashrate in megahashes per second (MH/s).
   */
  private calculateBlockHashrate(
    difficultyHex: string,
    averageBlockTimeSeconds: string,
  ): number {
    const difficulty = new BigNumber(difficultyHex);
    const averageBlockTime = new BigNumber(averageBlockTimeSeconds);

    const hashrateInHashesPerSecond = difficulty.dividedBy(averageBlockTime);

    const hashrateInMegahashesPerSecond =
      hashrateInHashesPerSecond.dividedBy(1e6);
    return hashrateInMegahashesPerSecond.toNumber();
  }
}
