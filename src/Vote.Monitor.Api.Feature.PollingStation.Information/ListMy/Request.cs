﻿using Vote.Monitor.Core.Security;

namespace Vote.Monitor.Api.Feature.PollingStation.Information.ListMy;

public class Request
{
    public Guid ElectionRoundId { get; set; }

    [FromClaim(ApplicationClaimTypes.UserId)]
    public Guid ObserverId { get; set; }

    [QueryParam] 
    public List<Guid>? PollingStationIds { get; set; }
}
