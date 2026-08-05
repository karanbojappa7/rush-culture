type ContextUser = {
  id?: string | null;
};

export class GlobalContext {
  private static user: ContextUser | null = null;

  static setUser(user: ContextUser | null): void {
    this.user = user;
  }

  static getUser(): ContextUser | null {
    return this.user;
  }

  static clear(): void {
    this.user = null;
  }
}
