import { LockedParam } from '../types/schema'
import { Locked } from '../types/Lock/Lock'

export function handleLocked(event: Locked): void {
  // load factory
  //   event.transaction.from.toHex()
  const from = event.transaction.from.toString()
  const txHash = event.transaction.hash.toHex()
  const sequencerId = event.params.sequencerId
  const nonce = event.params.nonce
  const activationBatch = event.params.activationBatch
  const amount = event.params.amount
  const signer = event.params.signer.toHex()
  const total = event.params.total
  const signerPubkey = event.params.signerPubkey.toHex()

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
    record.user = signer

    record.save()
  }
}
