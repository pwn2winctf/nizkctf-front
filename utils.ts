import dayjs from 'dayjs'

export const formatDateByLanguage = (timestamp: number, language: string) => {
  const defaultFormat = 'MM/DD/YYYY HH:mm:ss'
  const formats = {
    'pt-BR': 'DD/MM/YYYY HH:mm:ss',
  }

  return dayjs.unix(timestamp).format(formats[language] || defaultFormat)
}

export const fromUnixToDate = (timestamp: number) => {
  return dayjs(timestamp).toDate()
}

const dynamic_scoring = {
  "K": 80.0,
  "V": 3.0,
  "minpts": 50,
  "maxpts": 500
}

export const computeScore = num_solves => {
  const { K, V, minpts, maxpts } = dynamic_scoring;

  return Math.trunc(
    Math.max(
      minpts,
      Math.floor(maxpts - K * Math.log2((num_solves + V) / (1 + V)))
    )
  );
};


export const colors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000"
]