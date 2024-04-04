import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PollingStationInformationAPIPayload,
  PollingStationNomenclatorNodeAPIResponse,
  getElectionRounds,
  getPollingStationInformation,
  getPollingStationInformationForm,
  getPollingStationNomenclator,
  getPollingStationsVisits,
  upsertPollingStationGeneralInformation,
} from "./election-rounds.api";
import * as DB from "../../database/DAO/PollingStationsNomenclatorDAO";
import { performanceLog } from "../../helpers/misc";
import {
  ElectionRoundVM,
  transformElectionRoundsApiToVM,
} from "../../common/models/election-round.model";

import * as PollingStationInformationFormDAO from "../../database/DAO/PollingStationInformationForm.dao";

export const useElectionRoundsQuery = () => {
  return useQuery<ElectionRoundVM[]>({
    queryKey: ["election-rounds"],
    queryFn: async () => {
      /**
       *
       *  TODO: 1. Add schema for Election Rounds to be saved in DB
       *  TODO: 2. Get from DB, update from API
       *
       *
       *
       */
      const apiData = await getElectionRounds();
      return transformElectionRoundsApiToVM(apiData);
    },
  });
};

export const usePollingStationsNomenclatorQuery = (electionRoundId: string) => {
  return useQuery({
    queryKey: ["polling-stations-nomenclator", electionRoundId],
    queryFn: async () => {
      /**
       *
       *      We either get the data from Database or from API
       *
       *      TODO: Need to save and check if the CacheKey is the same (bust cache)
       */
      const count = await performanceLog(
        () => DB.getPollingStationNomenclatorNodesCount(electionRoundId),
        "DB.getPollingStationNomenclatorNodesCount"
      );
      console.log("usePollingStationsNomenclatorQuery", count);
      if (count > 0) {
        return "RETRIEVED FROM DB";
      } else {
        const data = await getPollingStationNomenclator(electionRoundId);
        await DB.addPollingStationsNomenclatureBulk(
          electionRoundId,
          data.nodes
        );
        return "ADDED TO DB";
      }
    },
    enabled: !!electionRoundId,
    // initialData
    // gcTime: Infinity,
    // staleTime: Infinity,
  });
};

export const usePollingStationsVisits = (electionRoundId: string) => {
  return useQuery({
    queryKey: ["polling-stations-visits", electionRoundId],
    queryFn: async () => {
      return getPollingStationsVisits(electionRoundId);
    },
    enabled: !!electionRoundId,
  });
};

export const usePollingStationByParentID = (parentId: number = -1) => {
  /**
   *
   *  We save the top-level parents with "parentId = -1" in DB
   *
   */
  return useQuery({
    queryKey: ["polling-stations-parent", parentId],
    queryFn: async () => {
      return DB.getPollingStationsByParentId(parentId);
    },
    enabled: !!parentId,
  });
};

export const usePollingStationById = (pollingStationId: number) => {
  /**
   *
   *  Caution, there are 2 IDs:
   *        ------------------ 1st: Generated by Watermelon available as "id" as STRING
   *        ------------------ 2nd: Added by us, received from backend as "_id" as NUMBER ----- WE PASS THIS ONE
   */
  return useQuery({
    queryKey: ["polling-station", pollingStationId],
    queryFn: async () => {
      return DB.getPollingStationById(pollingStationId);
    },
    enabled: !!pollingStationId,
  });
};

export const upsertPollingStationGeneralInformationMutation = () => {
  return useMutation({
    mutationKey: ["upsertPollingStationGeneralInformationMutation"],
    mutationFn: async (payload: PollingStationInformationAPIPayload) => {
      return upsertPollingStationGeneralInformation(payload);
    },
    gcTime: Infinity,
  });
};

export const usePollingStationInformationForm = (electionRoundId: string) => {
  return useQuery({
    queryKey: ["polling-station-information-form", electionRoundId],
    queryFn: async () => {
      // 1. Check if we have the "information form" in DB
      const existing = await PollingStationInformationFormDAO.get(
        electionRoundId
      );

      // 2. We have the form, return it
      if (existing) {
        return existing;
      } else {
        // 3. Get the form from API and save it to DB
        const data = await getPollingStationInformationForm(electionRoundId);
        const added = await PollingStationInformationFormDAO.add(
          electionRoundId,
          data
        );

        console.log("added", added);

        return data;
      }
    },
    enabled: !!electionRoundId,
  });
};

export const usePollingStationInformation = (
  electionRoundId: string,
  pollingStationIds?: string[]
) => {
  return useQuery({
    queryKey: [
      "polling-station-information",
      electionRoundId,
      pollingStationIds,
    ],
    queryFn: async () => {
      const data = await getPollingStationInformation(
        electionRoundId,
        pollingStationIds
      );
      console.log("usePollingStationInformation", data);
      return data;
    },
    enabled: !!electionRoundId,
  });
};

export const useCustomQueryToSaveData = () => {
  return useQuery({
    queryKey: ["test-data", 1],
    queryFn: async () => {
      return [
        {
          dragos: "strat",
        },
      ];
    },
    gcTime: 1,
    staleTime: 1,
  });
};
