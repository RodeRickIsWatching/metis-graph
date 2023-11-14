/* eslint-disable prefer-const */
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Block, UserEpochParam, NewEpochParam, ReCommitEpochParam } from "../types/schema";
import { ReCommitEpoch, NewEpoch } from '../types/MetisValidatorSet/MetisValidatorSet'

export function handleBlock(block: ethereum.Block): void {
  let entity = new Block(block.hash.toHex());
  entity.parentHash = block.parentHash;
  entity.unclesHash = block.unclesHash;
  entity.author = block.author;
  entity.stateRoot = block.stateRoot;
  entity.transactionsRoot = block.transactionsRoot;
  entity.receiptsRoot = block.receiptsRoot;
  entity.number = block.number;
  entity.gasUsed = block.gasUsed;
  entity.gasLimit = block.gasLimit;
  entity.timestamp = block.timestamp;
  entity.difficulty = block.difficulty;
  entity.totalDifficulty = block.totalDifficulty;
  entity.size = block.size;
  entity.save();
}

export function handleEpoch (event: NewEpoch): void{
  const epochId = event.params.epochId.toHex();
  let record = UserEpochParam.load(epochId)
  if(record == null){
    record = new UserEpochParam(epochId)
    record.epochId = BigInt.fromString(epochId);
    record.startBlock =  event.params.startBlock;
    record.endBlock =  event.params.endBlock;
    record.signer =  event.params.signer.toHex();
    
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp
    record.valid = true;
    

    record.save()
  }

  const txHash = event.transaction.hash.toHex()
  let txRecord = NewEpochParam.load(txHash)

  if (txRecord == null) {
    txRecord = new NewEpochParam(txHash)
    txRecord.epochId = BigInt.fromString(epochId);
    txRecord.startBlock =  event.params.startBlock;
    txRecord.endBlock =  event.params.endBlock;
    txRecord.signer =  event.params.signer.toHex();
    
    txRecord.block = event.block.number;
    txRecord.blockTimestamp = event.block.timestamp

    txRecord.save()
  }

}
export function handleReCommitEpoch(event: ReCommitEpoch): void {
  const newEpochId = event.params.newEpochId.toHex();
  const oldEpochId = event.params.oldEpochId.toHex();
  let oldRecord = UserEpochParam.load(oldEpochId)
  let newRecord = UserEpochParam.load(newEpochId)
  if(oldRecord != null){
    oldRecord.valid = false;
    oldRecord.save()
  }
  if(newRecord == null){
    newRecord = new UserEpochParam(newEpochId)
    newRecord.epochId = BigInt.fromString(newEpochId);
    newRecord.startBlock =  event.params.startBlock;
    newRecord.endBlock =  event.params.endBlock;
    newRecord.signer =  event.params.newSigner.toHex();
    
    newRecord.block = event.block.number;
    newRecord.blockTimestamp = event.block.timestamp
    newRecord.valid = true;

    newRecord.save()
  }
  


  const txHash = event.transaction.hash.toHex()
  let txRecord = ReCommitEpochParam.load(txHash)

  if (txRecord == null) {
    txRecord = new ReCommitEpochParam(txHash)
    txRecord.newEpochId = BigInt.fromString(newEpochId);
    txRecord.oldEpochId = BigInt.fromString(oldEpochId);
    txRecord.startBlock =  event.params.startBlock;
    txRecord.endBlock =  event.params.endBlock;
    txRecord.newSigner =  event.params.newSigner.toHex();
    
    txRecord.block = event.block.number;
    txRecord.blockTimestamp = event.block.timestamp

    txRecord.save()
  }


}