declare namespace NodeJS {
  export interface IProcess {
    gc?: () => void;
  }
}
