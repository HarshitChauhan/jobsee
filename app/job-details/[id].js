import React, { useCallback, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
} from "react-native";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import {
  Company,
  JobAbout,
  JobFooter,
  JobTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, icons, SIZES } from "../../constants";
import useFetch from "../../hooks/useFetch";

const tabs = ["About", "Qualifications", "Responsibilities"];

const JobShareMessage =
  "🌟Check out this exciting job opportunity\n\nJob Title: [Job Title]\nCompany: [Company Name]\nLocation: [Job Location]\nEmployment Type: [Employment Type]\n\n🔗 Job Link: [Insert Job Link Here]\n\nJoin me in exploring this fantastic job opportunity! It's a perfect match for your skills and career goals. Apply now and take your career to the next level. 🚀\n\n Credits: Jobsee App";

const JobDetails = () => {
  const router = useRouter();
  const { id: jobId } = useGlobalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { data, isLoading, error, refetch } = useFetch("job-details", {
    job_id: jobId,
  });

  const onShare = async () => {
    try {
      await Share.share({
        message: JobShareMessage.replace("[Job Title]", data[0].job_title)
          .replace("[Company Name]", data[0].employer_name)
          .replace("[Job Location]", data[0].job_country)
          .replace("[Employment Type]", data[0].job_employment_type)
          .replace("[Insert Job Link Here]", data[0].job_apply_link),
        url: data[0].job_google_link,
        title: data[0].job_title,
      });
    } catch (error) {
      console.log("error occured while sharing job link: ", error.message);
      alert(error.message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, []);

  const displayTabContent = () => {
    switch (activeTab) {
      case "Qualifications":
        return (
          <Specifics
            title="Qualifications"
            points={data[0].job_highlights?.Qualifications ?? ["N/A"]}
          />
        );

      case "About":
        return (
          <JobAbout info={data[0].job_description ?? "No data provided"} />
        );

      case "Responsibilities":
        return (
          <Specifics
            title="Responsibilities"
            points={data[0].job_highlights?.Responsibilities ?? ["N/A"]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTitle: "",
          headerTitleAlign: "center",
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
          headerRight: () => (
            // to add share functionality later (addon)
            <ScreenHeaderBtn
              iconUrl={icons.share}
              dimension="60%"
              handlePress={onShare}
            />
          ),
        }}
      />

      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : error ? (
            <Text>Something went wrong</Text>
          ) : data.length === 0 ? (
            <Text>No data found</Text>
          ) : (
            <View
              style={{
                padding: SIZES.medium,
                paddingBottom: 100,
              }}
            >
              <Company
                companyLogo={data[0].employer_logo}
                jobTitle={data[0].job_title}
                companyName={data[0].employer_name}
                location={data[0].job_country}
              />
              <JobTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {displayTabContent()}
            </View>
          )}
        </ScrollView>
        <JobFooter url={data[0]?.job_google_link ?? data[0]?.job_apply_link} />
      </>
    </SafeAreaView>
  );
};

export default JobDetails;
