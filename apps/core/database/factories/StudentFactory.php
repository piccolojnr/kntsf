<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_number' => fake()->unique()->numerify('STU-#####'),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'course' => fake()->randomElement([
                'Computer Science',
                'Information Technology',
                'Business Administration',
                'Public Administration',
            ]),
            'level' => fake()->randomElement(['100', '200', '300', '400']),
            'metadata' => [],
        ];
    }
}
