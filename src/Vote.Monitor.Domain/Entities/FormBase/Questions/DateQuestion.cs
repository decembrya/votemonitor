﻿using System.Text.Json.Serialization;
using Vote.Monitor.Core.Models;

namespace Vote.Monitor.Domain.Entities.FormBase.Questions;

public class DateQuestion : BaseQuestion
{
    [JsonConstructor]
    internal DateQuestion(Guid id,
        string code,
        TranslatedString text,
        TranslatedString? helptext) : base(id, code, text, helptext)
    {
    }

    public static DateQuestion Create(Guid id,
        string code,
        TranslatedString text,
        TranslatedString? helptext)
        => new(id, code, text, helptext);
}
