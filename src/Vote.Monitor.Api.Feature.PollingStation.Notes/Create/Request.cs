﻿using Vote.Monitor.Core.Security;

namespace Vote.Monitor.Api.Feature.PollingStation.Notes.Create;

public class Request
{
    public Guid ElectionRoundId { get; set; }

    public Guid PollingStationId { get; set; }

    [FromClaim(ClaimTypes.UserId)]
    public Guid ObserverId { get; set; }

    public string Text { get; set; } = string.Empty;
}
