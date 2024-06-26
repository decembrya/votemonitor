﻿using Vote.Monitor.Api.Feature.FormTemplate.Specifications;

namespace Vote.Monitor.Api.Feature.FormTemplate.Create;

public class Endpoint(IRepository<FormTemplateAggregate> repository) :
        Endpoint<Request, Results<Ok<FormTemplateSlimModel>, Conflict<ProblemDetails>>>
{
    public override void Configure()
    {
        Post("/api/form-templates");
    }

    public override async Task<Results<Ok<FormTemplateSlimModel>, Conflict<ProblemDetails>>> ExecuteAsync(Request req, CancellationToken ct)
    {
        var specification = new GetFormTemplateSpecification(req.Code, req.FormTemplateType);
        var duplicatedFormTemplate = await repository.AnyAsync(specification, ct);

        if (duplicatedFormTemplate)
        {
            AddError(r => r.Code, "A form template with same parameters already exists");
            return TypedResults.Conflict(new ProblemDetails(ValidationFailures));
        }

        var formTemplate = FormTemplateAggregate.Create(req.FormTemplateType, req.Code, req.DefaultLanguage, req.Name, req.Languages);

        await repository.AddAsync(formTemplate, ct);

        return TypedResults.Ok(new FormTemplateSlimModel
        {
            Id = formTemplate.Id,
            Code = formTemplate.Code,
            Languages = formTemplate.Languages.ToList(),
            DefaultLanguage = formTemplate.DefaultLanguage,
            Name = formTemplate.Name,
            Status = formTemplate.Status,
            CreatedOn = formTemplate.CreatedOn,
            LastModifiedOn = formTemplate.LastModifiedOn
        });
    }
}
