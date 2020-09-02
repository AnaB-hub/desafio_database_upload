import fs from 'fs';
import scvParser from 'csv-parse';

interface CVS {
  title: string;
  type: string;
  value: number;
  category: string;
}

async function readCsv(filePath: string): Promise<CVS[]> {
  const readCsvStream = fs.createReadStream(filePath);

  const parseStream = scvParser({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const lines: CVS[] = [];

  const parseCSV = readCsvStream.pipe(parseStream);
  parseCSV.on('data', (line: string[]) => {
    const [title, type, value, category] = line;

    const transaction = {
      title,
      type,
      value: Number(value),
      category,
    };

    lines.push(transaction);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

export default readCsv;
