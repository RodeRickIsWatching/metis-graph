import { ClaimRewardsParam, LockUpdateParam, LockedUserParam, LockedParam, RelockedParam, RewardUpdateParam, UnlockInitParam, UnlockedParam, WithrawDelayTimeChangeParam } from '../types/schema'
import { ClaimRewards, LockUpdate, Locked, Relocked, RewardUpdate, UnlockInit, Unlocked, WithrawDelayTimeChange } from '../types/Lock/Lock'

import {
  BigInt
} from "@graphprotocol/graph-ts";

export function handleLocked(event: Locked): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const nonce = event.params.nonce
  const activationBatch = event.params.activationBatch
  const amount = event.params.amount
  const signer = event.params.signer.toHex()
  const total = event.params.total
  const signerPubkey = event.params.signerPubkey.toHex()

  let lockedUserRecord = LockedUserParam.load(sequencerId.toHex())
  if(lockedUserRecord == null){
    lockedUserRecord = new LockedUserParam(sequencerId.toHex())
    lockedUserRecord.user = signer
    lockedUserRecord.amount = amount
    lockedUserRecord.signerPubkey = signerPubkey
    lockedUserRecord.block = event.block.number;
    lockedUserRecord.fromTimestamp = event.block.timestamp
    lockedUserRecord.sequencerId = sequencerId
    lockedUserRecord.claimAmount = BigInt.fromString('0')
    lockedUserRecord.save()
  }else{
    lockedUserRecord.amount = amount
    lockedUserRecord.save()
  }


  let record = LockedParam.load(txHash)

  if (record == null) {
    record = new LockedParam(txHash)
    record.sequencerId = sequencerId
    record.activationBatch = activationBatch
    record.nonce = nonce
    record.amount = amount
    record.signer = signer
    record.total = total
    record.signerPubkey = signerPubkey
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleUnlocked(event: Unlocked): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const amount = event.params.amount
  const total = event.params.total

  let record = UnlockedParam.load(txHash)

  if (record == null) {
    record = new UnlockedParam(txHash)
    record.sequencerId = sequencerId
    record.amount = amount
    record.total = total
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleUnlockInit(event: UnlockInit): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const nonce = event.params.nonce
  const amount = event.params.amount
  const deactivationBatch = event.params.deactivationBatch
  const deactivationTime = event.params.deactivationTime
  const unlockClaimTime = event.params.unlockClaimTime


  let lockedUserRecord = LockedUserParam.load(sequencerId.toHex())
  if(lockedUserRecord == null){}else if(sequencerId == lockedUserRecord.sequencerId){
    lockedUserRecord.amount = lockedUserRecord.amount.minus(amount)
    lockedUserRecord.save()
  }



  let record = UnlockInitParam.load(txHash)

  if (record == null) {
    record = new UnlockInitParam(txHash)
    record.sequencerId = sequencerId
    record.deactivationBatch = deactivationBatch
    record.nonce = nonce
    record.amount = amount
    record.deactivationTime = deactivationTime
    record.unlockClaimTime = unlockClaimTime
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleRelocked(event: Relocked): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const amount = event.params.amount
  const total = event.params.total


  let lockedUserRecord = LockedUserParam.load(sequencerId.toHex())
  if(lockedUserRecord == null){}else if(sequencerId == lockedUserRecord.sequencerId){
    lockedUserRecord.amount = total
    lockedUserRecord.save()
  }



  let record = RelockedParam.load(txHash)

  if (record == null) {
    record = new RelockedParam(txHash)
    record.sequencerId = sequencerId
    record.amount = amount
    record.total = total
    record.user = from
    // record.deltaAmount = 
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleWithdrawDelayTimeChange(event: WithrawDelayTimeChange): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const newWithrawDelayTime = event.params.newWithrawDelayTime
  const oldWithrawDelayTime = event.params.oldWithrawDelayTime

  let record = WithrawDelayTimeChangeParam.load(txHash)

  if (record == null) {
    record = new WithrawDelayTimeChangeParam(txHash)
    record.oldWithrawDelayTime = oldWithrawDelayTime
    record.newWithrawDelayTime = newWithrawDelayTime
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleRewardUpdate(event: RewardUpdate): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const oldReward = event.params.oldReward
  const newReward = event.params.newReward

  let record = RewardUpdateParam.load(txHash)

  if (record == null) {
    record = new RewardUpdateParam(txHash)
    record.oldReward = oldReward
    record.newReward = newReward
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleLockUpdate (event: LockUpdate): void{
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const nonce = event.params.nonce
  const newAmount = event.params.newAmount

  let record = LockUpdateParam.load(txHash)

  if (record == null) {
    record = new LockUpdateParam(txHash)
    record.sequencerId = sequencerId
    record.newAmount = newAmount
    record.nonce = nonce
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp

    record.save()
  }
}

export function handleClaimRewards(event: ClaimRewards): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toHex()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const amount = event.params.amount
  const totalAmount = event.params.totalAmount


  let lockedUserRecord = LockedUserParam.load(sequencerId.toHex())
  if(lockedUserRecord == null){
  }else{
    lockedUserRecord.claimAmount = lockedUserRecord.claimAmount + amount
    lockedUserRecord.save()
  }



  let record = ClaimRewardsParam.load(txHash)

  if (record == null) {
    record = new ClaimRewardsParam(txHash)
    record.sequencerId = sequencerId
    record.totalAmount = totalAmount
    record.amount = amount
    record.user = from
    record.block = event.block.number;
    record.blockTimestamp = event.block.timestamp;


    record.save();
  }
}
