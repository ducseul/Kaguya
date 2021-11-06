import { FORMATS, GENRES, SEASONS, SEASON_YEARS } from "@/constants";
import useBrowse, { UseBrowseOptions } from "@/hooks/useBrowse";
import { convert } from "@/utils/anime";
import { debounce } from "debounce";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import AnimeList from "../shared/AnimeList";
import Head from "../shared/Head";
import Input from "../shared/Input";
import InView from "../shared/InView";
import Select from "../shared/Select";
import AnimeListSkeleton from "../skeletons/AnimeListSkeleton";
import SortSelector from "./SortSelector";

const defaultValues: UseBrowseOptions = {
  format: "",
  keyword: "",
  genre: "",
  season: "",
  seasonYear: "",
  sort: "average_score",
};

const genres = GENRES.map((genre) => ({
  value: genre as string,
  placeholder: convert(genre, "genre"),
}));

const seasonYears = SEASON_YEARS.map((year) => ({
  value: year.toString(),
  placeholder: year.toString(),
}));

const seasons = SEASONS.map((season) => ({
  value: season,
  placeholder: convert(season, "season"),
}));

const formats = FORMATS.map((format) => ({
  value: format,
  placeholder: convert(format, "format"),
}));

interface BrowseListProps {
  defaultQuery?: UseBrowseOptions;
  title?: string;
}

const BrowseList: React.FC<BrowseListProps> = ({
  defaultQuery = defaultValues,
  title,
}) => {
  const { control, register, watch, setValue } = useForm<UseBrowseOptions>({
    defaultValues: defaultQuery,
  });

  const query = watch();

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useBrowse(query);

  const handleFetch = () => {
    if (isFetchingNextPage || !hasNextPage) return;

    fetchNextPage();
  };

  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue("keyword", e.target.value),
    500
  );

  return (
    <div className="min-h-screen px-4 md:px-12">
      <Head title={`${title} - Kaguya` || "Kaguya"} />

      {title && (
        <p className="text-4xl text-center md:text-left font-semibold mb-8">
          {title}
        </p>
      )}

      <form className="space-y-4">
        <div className="flex md:justify-between gap-x-2 items-center overflow-x-auto md:flex-wrap md:overflow-x-hidden snap-x md:snap-none">
          <Input
            {...register("keyword")}
            LeftIcon={AiOutlineSearch}
            onChange={handleInputChange}
            label="Tìm kiếm"
          />
          <Controller
            name="genre"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                label="Thể loại"
                data={genres}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="seasonYear"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                label="Năm"
                data={seasonYears}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="season"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select label="Mùa" data={seasons} onChange={field.onChange} />
            )}
          />

          <Controller
            name="format"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                label="Định dạng"
                data={formats}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center space-x-4 justify-end">
          <Controller
            name="sort"
            control={control}
            defaultValue={defaultQuery.sort}
            render={({ field }) => (
              <SortSelector
                defaultValue={defaultQuery.sort}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </form>

      <div className="mt-8">
        {!isLoading && query ? (
          <React.Fragment>
            <AnimeList data={data.pages.map((el) => el.data).flat()} />

            {(!isFetchingNextPage || !hasNextPage) && (
              <InView onInView={handleFetch} />
            )}

            {isFetchingNextPage && (
              <div className="mt-4">
                <AnimeListSkeleton />
              </div>
            )}
          </React.Fragment>
        ) : (
          <AnimeListSkeleton />
        )}
      </div>
    </div>
  );
};

export default BrowseList;
