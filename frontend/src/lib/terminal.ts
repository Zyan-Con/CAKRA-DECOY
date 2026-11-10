/** Input terminal kosong bukan perintah: tidak dikirim, dan tidak boleh menyelesaikan langkah 2. */
export function cleanCommand(raw: string): string | null {
  const cmd = raw.trim();
  return cmd.length > 0 ? cmd : null;
}
