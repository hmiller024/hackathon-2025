using System;

public class TrackedWebsite
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Name {  get; set; } = string.Empty ;
    public string LastHash { get; set; } = string.Empty;
    public DateTime LastChecked { get; set; } = DateTime.UtcNow;
}