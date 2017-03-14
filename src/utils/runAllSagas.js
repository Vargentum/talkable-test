/* -----------------------------
  Helper for easier applying sagas from namespace
----------------------------- */

export default function runAllSagas (runner, sagas) {
  Object.keys(sagas).forEach((sagaName) => {
    const saga = sagas[sagaName]
    runner(saga)
  })
}
