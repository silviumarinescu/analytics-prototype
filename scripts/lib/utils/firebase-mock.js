export const firebase = {
  firestore: {
    FieldValue: {
      increment: (incrementValue) => {
        return {
          incrementValue,
        }
      },
    },
  },
}
