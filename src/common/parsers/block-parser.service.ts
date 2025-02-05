import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { add0x } from '@rsksmart/rsk-utils';
import { block as IBlock } from '@prisma/client';

@Injectable()
export class BlockParserService {
  formatBlock(blocks: IBlock[]) {
    const currentBlocks = [...blocks].reverse();
    const newBlocks = currentBlocks.slice(1);
    const formatData = newBlocks.map((block, i) => {
      const prevBlock = currentBlocks[i];
      const timeDifference = block.timestamp - prevBlock.timestamp;

      const difficultyInGH = this.calculateDifficultyInGH(block.difficulty);
      const totalDifficultyInEH = this.calculateTotalDifficultyInEH(
        block.totalDifficulty,
      );
      const transactionsCount = JSON.parse(block.transactions).length;
      const blockHashrateInMHs = this.calculateBlockHashrate(
        block.difficulty,
        timeDifference.toString(),
      );
      const txDensity = transactionsCount / Number(timeDifference);
      const time = this.secondsToReadableTime(timeDifference);

      const gasPrice = new BigNumber(block.minimumGasPrice)
        .dividedBy(1e9)
        .toNumber();
      delete block?.received;

      return {
        ...block,
        uncles: JSON.parse(block.uncles),
        minimumGasPrice: gasPrice,
        difficultyInGH: difficultyInGH,
        totalDifficultyInEH: totalDifficultyInEH,
        blockHashrateInMHs,
        timestamp: block.timestamp.toString(),
        transactions: transactionsCount,
        txDensity,
        time,
      };
    });
    return formatData.reverse();
  }

  private secondsToReadableTime(seconds: bigint) {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  private calculateDifficultyInGH(difficultyHex: string): number {
    const difficultyDecimal = new BigNumber(difficultyHex, 16);
    return difficultyDecimal.dividedBy(1e9).toNumber();
  }

  private calculateTotalDifficultyInEH(totalDifficultyHex: string): number {
    const totalDifficultyDecimal = new BigNumber(
      totalDifficultyHex.toString(),
      16,
    );
    return totalDifficultyDecimal.dividedBy(1e18).toNumber();
  }

  private calculateBlockHashrate(difficultyHex: string, time: string): number {
    const averageBlockTime = new BigNumber(time);
    let blockHashrate: BigNumber | string = new BigNumber(
      difficultyHex,
    ).dividedBy(averageBlockTime);

    blockHashrate = add0x(blockHashrate.toString());
    blockHashrate = new BigNumber(blockHashrate.toString());
    return blockHashrate.dividedBy(1e6).toNumber();
  }
}
