import yaml from 'js-yaml';
import fs from 'fs';

const YAML_EXTENSION = '.yaml';
export default class YAMLReader {
  readonly config_file: string;

  constructor(config_file: string) {
    if (!config_file.endsWith(YAML_EXTENSION)) {
      throw new Error(`Config file must end with ${YAML_EXTENSION}`);
    }
    this.config_file = config_file;
  }

  async readConfig() {
    try {
      const doc = await yaml.load(fs.readFileSync(this.config_file, 'utf8'));
      console.log(doc)
      return doc;
    } catch (error) {
      console.error('Error reading YAML:', error);
      throw error;
    }
  }
}