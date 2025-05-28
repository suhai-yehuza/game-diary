declare namespace NodeJS {
  interface Process {
    gc?: () => void;
  }
}
